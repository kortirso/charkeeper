# frozen_string_literal: true

module Dnd2024Character
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
      Dnd2024::Character::Feature.where(origin: 'species', origin_value: result[:species])
        .or(Dnd2024::Character::Feature.where(origin: 'class', origin_value: result[:classes].keys))
        .order(level: :asc)
        .select do |feature|
          next result[:overall_level] >= feature.level if feature.origin == 'species'
          next result[:classes][feature.origin_value] >= feature.level if feature.origin == 'class'

          false
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
