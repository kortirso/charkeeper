# frozen_string_literal: true

module Dnd2024
  module Classes
    class MonkDecorator < ApplicationDecoratorV2
      NOT_MONK_WEAPON_TYPES = %w[range thrown].freeze
      CLASS_SAVE_DC = %w[str dex].freeze
      EXTENDED_CLASS_SAVE_DC = %w[str dex con int wis cha].freeze

      def call(result:) # rubocop: disable Metrics/AbcSize
        @result = result
        @result['class_save_dc'] = class_save_dc if main_class == 'monk'
        @result['spell_classes']['monk'] = { multiclass_spell_level: 0 }
        @result['spells_slots'] = { 1 => 0 }
        @result['speed'] = speed + speed_modifier if no_armor
        @result['armor_class'] = [armor_class, monk_armor_class].max if no_armor
        @result['attacks_per_action'] = 2 if class_level >= 5
        find_static_spells
        update_attacks_with_martial_arts if no_armor
        @result
      end

      private

      def class_save_dc
        class_level >= 14 ? EXTENDED_CLASS_SAVE_DC : CLASS_SAVE_DC
      end

      def class_level
        @class_level ||= classes['monk']
      end

      def speed_modifier
        return 0 if class_level < 2

        (((class_level + 2) / 4) + 1) * 5
      end

      def monk_armor_class
        10 + modifiers['dex'] + modifiers['wis']
      end

      def update_attacks_with_martial_arts # rubocop: disable Metrics/AbcSize
        key_ability_bonus = [modifiers['str'], modifiers['dex']].max

        @result['attacks'].each do |attack|
          next if NOT_MONK_WEAPON_TYPES.include?(attack[:type])
          next if attack[:kind] == 'martial' && attack[:caption].exclude?('light')

          attack[:attack_bonus] = key_ability_bonus + proficiency_bonus
          attack[:damage_bonus] = key_ability_bonus
          attack[:damage] = "1d#{[attack[:damage].split('d')[-1].to_i, ((((class_level + 1) / 6) + 2) * 2) + 2].max}"
          attack[:tooltips] = attack[:tooltips].push('monk').uniq
          attack[:tags] = attack[:tags].merge('monk' => I18n.t('tags.dnd.weapon.title.monk'))
        end
      end
    end
  end
end
