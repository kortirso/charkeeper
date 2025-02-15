# frozen_string_literal: true

module Dnd5Character
  module Classes
    class MonkDecorator
      WEAPON_CORE = ['light weapon'].freeze
      DEFAULT_WEAPON_SKILLS = %w[shortsword].freeze
      NOT_MONK_WEAPON_CAPTIONS = %w[2handed heavy].freeze

      def decorate_fresh_character(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS).uniq
        result[:abilities] = { str: 12, dex: 15, con: 13, int: 11, wis: 14, cha: 10 }
        result[:health] = { current: 9, max: 9, temp: 0 }

        result
      end

      # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      def decorate_character_abilities(result:, class_level:)
        result[:class_save_dc] = %i[str dex] if result[:main_class] == 'monk'
        result[:hit_dice][8] += class_level

        no_armor = result[:defense_gear].values.all?(&:nil?)
        result[:combat][:speed] += speed_modifier(class_level) if no_armor
        result[:combat][:armor_class] = [result[:combat][:armor_class], monk_armor_class(result)].max if no_armor

        martial_arts(result, class_level) if no_armor # Martial arts, 1 level
        result[:combat][:attacks_per_action] = 2 if class_level >= 5 # Extra Attack, 5 level

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
          next if attack[:caption].any? { |item| NOT_MONK_WEAPON_CAPTIONS.include?(item) }
          next if attack[:kind] == 'martial' && attack[:slug] != 'shortsword'

          attack[:attack_bonus] = key_ability_bonus + result[:proficiency_bonus]
          attack[:damage_bonus] = key_ability_bonus if attack[:action_type] == 'action'
          attack[:damage] = "1d#{(((class_level + 1) / 6) + 2) * 2}" if attack[:kind] == 'unarmed'
        end
        unarmed_attack = result[:attacks].find { |attack| attack[:kind] == 'unarmed' && attack[:action_type] == 'action' }
        result[:attacks] << unarmed_attack.merge({ action_type: 'bonus action', tooltips: ['flurry_of_blows'] })
      end
      # rubocop: enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    end
  end
end
