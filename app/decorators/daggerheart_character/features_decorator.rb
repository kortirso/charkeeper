# frozen_string_literal: true

module DaggerheartCharacter
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

    # rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity
    def features
      @features ||= begin
        visible_features = available_features.filter_map do |feature|
          visible = eval_variable(feature.visible)
          next unless visible

          feature
        end

        excludes = visible_features.pluck(:exclude).flatten.compact.uniq
        visible_features.filter_map do |feature|
          next if feature.slug.in?(excludes)

          feature.eval_variables.each do |method_name, variable|
            instance_variable_set(:"@#{method_name}", eval_variable(variable))
          end
          next if feature.kind == 'update_result'

          feature.description_eval_variables.transform_values! { |value| eval_variable(value) }
          {
            slug: feature.slug,
            kind: feature.kind,
            title: feature.title[I18n.locale.to_s],
            description: update_feature_description(feature),
            limit: feature.description_eval_variables['limit'],
            limit_refresh: feature.limit_refresh
          }.compact
        end
      end
    end
    # rubocop: enable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity

    private

    def available_features
      Daggerheart::Character::Feature.where(origin: 'ancestry', origin_value: heritage)
        .or(Daggerheart::Character::Feature.where(origin: 'community', origin_value: community))
        .or(Daggerheart::Character::Feature.where(origin: 'class', origin_value: classes.keys))
        .or(Daggerheart::Character::Feature.where(origin: 'subclass', origin_value: subclasses.values))
        .to_a
    end

    def update_feature_description(feature)
      result = feature.description[I18n.locale.to_s]
      feature.description_eval_variables.each { |key, value| result.gsub!("{{#{key}}}", value.to_s) }
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
end
