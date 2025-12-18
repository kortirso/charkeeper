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

  # rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity, Metrics/BlockLength, Metrics/CyclomaticComplexity
  def features
    @features ||=
      available_features.filter_map do |feature|
        # добавлять статические бонусы или включенные
        if feature_bonuses_enabled?(feature)
          feature.feat.eval_variables.each do |method_name, variable|
            result = eval_variable(feature.feat, variable)
            instance_variable_set(:"@#{method_name}", result) if result
          end
        end
        next if feature.feat.kind == 'hidden'

        feature.feat.description_eval_variables.transform_values! do |value|
          eval_variable(feature.feat, value) || value
        end
        {
          id: feature.id,
          slug: feature.feat.slug || feature.id,
          kind: feature.feat.kind,
          title: feature.feat.title[I18n.locale.to_s],
          description: update_feature_description(feature),
          limit: feature.feat.description_eval_variables['limit'],
          used_count: feature.used_count,
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
  end
  # rubocop: enable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity, Metrics/BlockLength, Metrics/CyclomaticComplexity

  private

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
