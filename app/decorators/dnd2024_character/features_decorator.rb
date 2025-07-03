# frozen_string_literal: true

module Dnd2024Character
  class FeaturesDecorator
    attr_accessor :wrapped

    LEVEL_LIMITED_ORIGINS = %w[feat species legacy].freeze

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
            options_type: feature.options_type,
            options: feature.options,
            choose_once: feature.choose_once,
            limit: feature.description_eval_variables['limit'],
            limit_refresh: feature.limit_refresh
          }.compact
        end
      end
    end

    private

    def available_features
      subclass_levels = subclasses.each_with_object({}) do |(class_slug, subclass_slug), acc|
        next if subclass_slug.nil?

        acc[subclass_slug] = classes[class_slug]
      end

      Dnd2024::Character::Feature.where(origin: 'species', origin_value: species)
        .or(Dnd2024::Character::Feature.where(origin: 'legacy', origin_value: legacy))
        .or(Dnd2024::Character::Feature.where(origin: 'class', origin_value: classes.keys))
        .or(Dnd2024::Character::Feature.where(origin: 'subclass', origin_value: subclasses.values))
        .or(Dnd2024::Character::Feature.where(origin: 'feat', slug: selected_feats))
        .order(level: :asc)
        .to_a
        .select do |feature|
          next level >= feature.level if feature.origin.in?(LEVEL_LIMITED_ORIGINS)
          next classes[feature.origin_value] >= feature.level if feature.origin == 'class'

          subclass_levels[feature.origin_value].to_i >= feature.level
        end
    end
    # rubocop: enable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity

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
