# frozen_string_literal: true

module Dnd5Character
  class FeaturesDecorator
    # rubocop: disable Metrics/AbcSize
    def decorate_character_abilities(result:)
      available_features(result).each do |feature|
        visible = eval_variable(feature.visible, result)
        next unless visible

        feature.eval_variables.transform_values! { |value| eval_variable(value, result) }
        next if feature.kind == 'update_result'

        result[:features] << {
          slug: feature.slug,
          kind: feature.kind,
          title: feature.title[I18n.locale.to_s],
          description: update_feature_description(feature),
          limit: feature.eval_variables['limit'],
          options_type: feature.options_type,
          options: feature.options,
          choose_once: feature.choose_once
        }.compact
      end

      result
    end

    private

    def available_features(result)
      subclass_levels = result[:subclasses].each_with_object({}) do |(class_slug, subclass_slug), acc|
        next if subclass_slug.nil?

        acc[subclass_slug] = result.dig(:classes, class_slug)
      end

      Dnd5::Character::Feature.where(origin: 'race', origin_value: result[:race])
        .or(Dnd5::Character::Feature.where(origin: 'subrace', origin_value: result[:subrace]))
        .or(Dnd5::Character::Feature.where(origin: 'class', origin_value: result[:classes].keys))
        .or(Dnd5::Character::Feature.where(origin: 'subclass', origin_value: result[:subclasses].values))
        .order(level: :asc)
        .select do |feature|
          next result[:overall_level] >= feature.level if feature.origin.in?(%w[race subrace])
          next result[:classes][feature.origin_value] >= feature.level if feature.origin == 'class'

          subclass_levels[feature.origin_value].to_i >= feature.level
        end
    end
    # rubocop: enable Metrics/AbcSize

    def update_feature_description(feature)
      result = feature.description[I18n.locale.to_s]
      feature.eval_variables.each { |key, value| result.gsub!("{{#{key}}}", value.to_s) }
      result
    end

    # rubocop: disable Security/Eval, Lint/UnusedMethodArgument, Style/MethodCalledOnDoEndBlock
    def eval_variable(variable, result)
      lambda do
        eval(variable)
      end.call
    end
    # rubocop: enable Security/Eval, Lint/UnusedMethodArgument, Style/MethodCalledOnDoEndBlock
  end
end
