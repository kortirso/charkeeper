# frozen_string_literal: true

module Dnd5Character
  module Classes
    class FighterDecorator
      def decorate(result:, class_level:) # rubocop: disable Lint/UnusedMethodArgument
        result[:class_save_dc] = %i[str con] if result[:main_class] == 'fighter'

        result[:selected_features].each do |feature_slug, options|
          options.each { |option| send(:"#{feature_slug}_#{option}", result) }
        end

        result
      end

      private

      def fighting_style_defense(result)
        result[:combat][:armor_class] += 1 if result.dig(:defense_gear, :armor).present?
      end

      def fighting_style_archery(result)
        result[:attacks].each do |attack|
          next if attack[:type] != 'range'

          attack[:attack_bonus] += 2
        end
      end

      def fighting_style_dueling(result)
        result[:attacks].each do |attack|
          next if attack[:type] != 'melee'
          next if attack[:hands] != '1'
          next if attack[:tooltips].include?('dual')

          attack[:damage_bonus] += 2
        end
      end
    end
  end
end
