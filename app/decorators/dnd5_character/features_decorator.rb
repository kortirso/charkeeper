# frozen_string_literal: true

module Dnd5Character
  class FeaturesDecorator
    attr_accessor :wrapped

    def initialize(obj)
      @wrapped = obj
    end

    def method_missing(method, *_args)
      if instance_variable_defined?(:"@#{method}")
        instance_variable_get(:"@#{method}")
      else
        wrapped.public_send(method)
      end
    end

    # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
    def features
      @features ||= begin
        result = wrapped.features
        available_features.each do |feature|
          visible = eval_variable(feature.visible)
          next unless visible

          feature.eval_variables.each do |method_name, variable|
            instance_variable_set(:"@#{method_name}", eval_variable(variable))
          end

          feature.eval_variables.transform_values! { |value| eval_variable(value) }
          next if feature.kind == 'update_result'

          feature.description_eval_variables.transform_values! { |value| eval_variable(value) }

          result << {
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
        result
      end
    end

    private

    def available_features
      subclass_levels = subclasses.each_with_object({}) do |(class_slug, subclass_slug), acc|
        next if subclass_slug.nil?

        acc[subclass_slug] = classes[class_slug]
      end

      Dnd5::Character::Feature.where(origin: 'race', origin_value: race)
        .or(Dnd5::Character::Feature.where(origin: 'subrace', origin_value: subrace))
        .or(Dnd5::Character::Feature.where(origin: 'class', origin_value: classes.keys))
        .or(Dnd5::Character::Feature.where(origin: 'class', origin_value: 'all'))
        .or(Dnd5::Character::Feature.where(origin: 'subclass', origin_value: subclasses.values))
        .order(level: :asc)
        .select do |feature|
          next true if feature.origin_value == 'all'
          next level >= feature.level if feature.origin.in?(%w[race subrace])
          next classes[feature.origin_value] >= feature.level if feature.origin == 'class'

          subclass_levels[feature.origin_value].to_i >= feature.level
        end
    end
    # rubocop: enable Metrics/AbcSize, Metrics/MethodLength

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
