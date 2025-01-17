# frozen_string_literal: true

module Dnd5
  module Classes
    class MonkDecorator
      # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      def decorate(result:, class_level:)
        result[:class_saving_throws] = %i[str dex] if result[:class_saving_throws].nil?

        no_armor = result[:defense_gear].values.all?(&:nil?)
        result[:combat][:speed] += speed_modifier(class_level) if no_armor
        result[:combat][:armor_class] = [result[:combat][:armor_class], monk_armor_class(result)].max if no_armor

        # Martial arts, 1 level
        martial_arts(result, class_level) if no_armor

        result
      end

      private

      def speed_modifier(class_level)
        return 0 if class_level < 2

        (((class_level + 2) / 4) + 1) * 5
      end

      def monk_armor_class(result)
        10 + result.dig(:modifiers, :dex) + result.dig(:modifiers, :wis)
      end

      def martial_arts(result, class_level)
        key_ability_bonus = [result.dig(:modifiers, :str), result.dig(:modifiers, :dex)].max

        result[:attacks].each do |attack|
          next if attack[:caption].include?('2handed')
          next if attack[:caption].include?('heavy')
          next if attack[:kind].include?('martial') && attack.dig(:name, :en) != 'Shortsword'

          attack[:attack_bonus] = key_ability_bonus + result[:proficiency_bonus]
          attack[:damage_bonus] = key_ability_bonus if attack[:action_type] == 'action'
          attack[:damage] = "1d#{(((class_level + 1) / 6) + 2) * 2}" if attack[:kind] == 'arms'
        end

        arms_attack = result[:attacks].find { |attack| attack[:kind] == 'arms' && attack[:action_type] == 'action' }
        result[:attacks] << arms_attack.merge({ action_type: 'bonus action' })
      end
      # rubocop: enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    end
  end
end
