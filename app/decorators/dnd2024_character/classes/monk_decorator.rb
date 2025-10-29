# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class MonkDecorator < ApplicationDecorator
      NOT_MONK_WEAPON_TYPES = %w[range thrown].freeze
      CLASS_SAVE_DC = %w[str dex].freeze
      EXTENDED_CLASS_SAVE_DC = %w[str dex con int wis cha].freeze

      def class_save_dc
        @class_save_dc ||=
          if main_class == 'monk'
            class_level >= 14 ? EXTENDED_CLASS_SAVE_DC : CLASS_SAVE_DC
          else
            __getobj__.class_save_dc
          end
      end

      def spell_classes
        @spell_classes ||= begin
          result = __getobj__.spell_classes
          result[:monk] = { multiclass_spell_level: 0 }
          result
        end
      end

      def spells_slots
        @spells_slots ||= { 1 => 0 }
      end

      def speed
        @speed ||= no_armor ? (__getobj__.speed + speed_modifier) : __getobj__.speed
      end

      def armor_class
        @armor_class ||= no_armor ? [__getobj__.armor_class, monk_armor_class].max : __getobj__.armor_class
      end

      def attacks
        @attacks ||= no_armor ? with_martial_arts : __getobj__.attacks
      end

      def attacks_per_action
        @attacks_per_action ||= class_level >= 5 ? 2 : 1
      end

      private

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

      def no_armor
        @no_armor ||= defense_gear.values.all?(&:nil?)
      end

      # rubocop: disable Metrics/AbcSize
      def with_martial_arts
        result = __getobj__.attacks
        key_ability_bonus = [modifiers['str'], modifiers['dex']].max

        result.each do |attack|
          next if NOT_MONK_WEAPON_TYPES.include?(attack[:type])
          next if attack[:kind] == 'martial' && attack[:caption].exclude?('light')

          attack[:attack_bonus] = key_ability_bonus + proficiency_bonus
          attack[:damage_bonus] = key_ability_bonus
          attack[:damage] = "1d#{[attack[:damage].split('d')[-1].to_i, ((((class_level + 1) / 6) + 2) * 2) + 2].max}"
          attack[:tooltips] = attack[:tooltips].push('monk').uniq
          attack[:tags] = attack[:tags].merge('monk' => I18n.t('tags.dnd.weapon.title.monk'))
        end
        result
      end
      # rubocop: enable Metrics/AbcSize
    end
  end
end
