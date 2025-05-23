# frozen_string_literal: true

module Dnd5Character
  module Classes
    class WarlockDecorator < ApplicationDecorator
      SPELL_SLOTS = {
        1 => { 1 => 1 },
        2 => { 1 => 2 },
        3 => { 2 => 2 },
        4 => { 2 => 2 },
        5 => { 3 => 2 },
        6 => { 3 => 2 },
        7 => { 4 => 2 },
        8 => { 4 => 2 },
        9 => { 5 => 2 },
        10 => { 5 => 2 },
        11 => { 5 => 3 },
        12 => { 5 => 3 },
        13 => { 5 => 3 },
        14 => { 5 => 3 },
        15 => { 5 => 3 },
        16 => { 5 => 3 },
        17 => { 5 => 4 },
        18 => { 5 => 4 },
        19 => { 5 => 4 },
        20 => { 5 => 4 }
      }.freeze
      CLASS_SAVE_DC = %w[wis cha].freeze

      def class_save_dc
        @class_save_dc ||= main_class == 'warlock' ? CLASS_SAVE_DC : __getobj__.class_save_dc
      end

      def spell_classes
        @spell_classes ||= begin
          result = __getobj__.spell_classes
          result[:warlock] = {
            save_dc: 8 + proficiency_bonus + modifiers['cha'],
            attack_bonus: proficiency_bonus + modifiers['cha'],
            cantrips_amount: cantrips_amount,
            spells_amount: spells_amount,
            max_spell_level: max_spell_level,
            prepared_spells_amount: spells_amount,
            multiclass_spell_level: class_level # full level
          }
          result
        end
      end

      def spells_slots
        @spells_slots ||= SPELL_SLOTS[class_level]
      end

      private

      def class_level
        @class_level ||= classes['warlock']
      end

      def cantrips_amount
        return 4 if class_level >= 10
        return 3 if class_level >= 4

        2
      end

      def spells_amount
        return class_level + 1 if class_level < 9

        10 + ((class_level - 9) / 2)
      end

      def max_spell_level
        SPELL_SLOTS[class_level].keys.max
      end
    end
  end
end
