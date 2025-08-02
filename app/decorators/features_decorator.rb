# frozen_string_literal: true

class FeaturesDecorator
  attr_accessor :wrapped

  def initialize(obj)
    @wrapped = obj
  end

  def method_missing(method, *_args)
    if instance_variable_defined?(:"@#{method}")
      instance_variable_get(:"@#{method}")
    else
      instance_variable_set(:"@#{method}", wrapped.public_send(method))
    end
  end

  # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
  def features
    @features ||=
      available_features.filter_map do |feature|
        feature.feat.eval_variables.each do |method_name, variable|
          instance_variable_set(:"@#{method_name}", eval_variable(variable))
        end
        next if feature.feat.kind == 'update_result'

        feature.feat.description_eval_variables.transform_values! { |value| eval_variable(value) }
        {
          id: feature.id,
          slug: feature.feat.slug,
          kind: feature.feat.kind,
          title: feature.feat.title[I18n.locale.to_s],
          description: update_feature_description(feature),
          limit: feature.feat.description_eval_variables['limit'],
          used_count: feature.used_count,
          limit_refresh: feature.feat.limit_refresh,
          options: feature.feat.options,
          value: feature.value,
          origin: feature.feat.origin
        }.compact
      end
  end
  # rubocop: enable Metrics/AbcSize, Metrics/MethodLength

  private

  def available_features
    wrapped.feats.includes(:feat).order('feats.origin ASC, feats.created_at ASC')
  end

  def update_feature_description(feature)
    result = feature.feat.description[I18n.locale.to_s]
    feature.feat.description_eval_variables.each { |key, value| result.gsub!("{{#{key}}}", value.to_s) }
    result
  end

  # rubocop: disable Security/Eval, Style/MethodCalledOnDoEndBlock
  def eval_variable(variable)
    lambda do
      eval(variable)
    end.call
  end
  # rubocop: enable Security/Eval, Style/MethodCalledOnDoEndBlock
end
