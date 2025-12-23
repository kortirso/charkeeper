# frozen_string_literal: true

class FeaturesDecorator
  attr_accessor :wrapped, :version, :logger

  def initialize(obj, version: nil)
    @wrapped = obj
    @version = version
    @logger = Logger.new($stdout)
  end

  def method_missing(method, *_args)
    if instance_variable_defined?(:"@#{method}")
      instance_variable_get(:"@#{method}")
    else
      instance_variable_set(:"@#{method}", wrapped.public_send(method))
    end
  end

  def features # rubocop: disable Metrics/PerceivedComplexity
    @features ||=
      available_features.filter_map { |feature| perform_feature(feature, available_features) } +
      (
        equiped_items_info&.flat_map { |item|
          item[0]['features']&.map { |feature| item_feature_payload(item, feature) }
        }&.compact || []
      )
  end

  private

  def perform_feature(feature, available_features)
    # добавлять статические бонусы или включенные
    if feature_bonuses_enabled?(feature)
      feature.feat.eval_variables.each do |method_name, variable|
        result = eval_variable(feature.feat, variable)
        instance_variable_set(:"@#{method_name}", result) if result
      end
    end
    return if feature.feat.kind == 'hidden'

    feature.feat.description_eval_variables.transform_values! do |value|
      eval_variable(feature.feat, value) || value
    end

    result = feature_payload(feature, available_features)
    result.merge(used_count: feature.used_count)
  end

  def feature_payload(feature, available_features) # rubocop: disable Metrics/AbcSize
    {
      id: feature.id,
      slug: feature.feat.slug || feature.id,
      kind: feature.feat.kind,
      title: feature.feat.title[I18n.locale.to_s],
      description: update_feature_description(feature),
      limit: feature.feat.description_eval_variables['limit'],
      limit_refresh: feature.feat.limit_refresh,
      options: feature.feat.options,
      value: feature.value,
      origin: feature.feat.origin == 'parent' ? available_features.find { |f| f.feat.slug == feature.feat.origin_value }.feat.origin : feature.feat.origin, # rubocop: disable Layout/LineLength
      active: feature.active,
      continious: feature.feat.continious,
      ready_to_use: feature.ready_to_use,
      price: feature.feat.price,
      info: feature.feat.info
    }.compact
  end

  def item_feature_payload(item, feature)
    {
      id: item[2],
      slug: item[2],
      kind: 'static',
      title: item[1][I18n.locale.to_s],
      description: feature[I18n.locale.to_s],
      origin: 'equipment',
      price: {},
      info: {}
    }
  end

  def feature_bonuses_enabled?(feature)
    (!feature.feat.continious && feature.ready_to_use) || feature.active
  end

  def update_feature_description(feature)
    description = feature.feat.description[I18n.locale.to_s]
    return if description.blank?

    result = Charkeeper::Container.resolve('markdown').call(
      value: description,
      version: version
    )
    feature.feat.description_eval_variables.each { |key, value| result.gsub!("{{#{key}}}", value.to_s) }
    result
  end

  # rubocop: disable Security/Eval, Style/MethodCalledOnDoEndBlock
  def eval_variable(feat, variable)
    lambda do
      eval(variable)
    end.call
  rescue StandardError, SyntaxError => e
    monitoring_feat_error(e, feat)
    nil
  end
  # rubocop: enable Security/Eval, Style/MethodCalledOnDoEndBlock

  def monitoring_feat_error(exception, feat)
    Charkeeper::Container.resolve('monitoring.client').notify(
      exception: Monitoring::FeatVariableError.new('Feat variable error'),
      metadata: { slug: feat.slug, message: exception.message },
      severity: :info
    )
  end
end
