# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class ArcaneTricksterDecorator < ApplicationDecorator
      SPELL_SLOTS = {
        1 => { 1 => 0 },
        2 => { 1 => 0 },
        3 => { 1 => 2 },
        4 => { 1 => 3 },
        5 => { 1 => 3 },
        6 => { 1 => 3 },
        7 => { 1 => 4, 2 => 2 },
        8 => { 1 => 4, 2 => 2 },
        9 => { 1 => 4, 2 => 2 },
        10 => { 1 => 4, 2 => 3 },
        11 => { 1 => 4, 2 => 3 },
        12 => { 1 => 4, 2 => 3 },
        13 => { 1 => 4, 2 => 3, 3 => 2 },
        14 => { 1 => 4, 2 => 3, 3 => 2 },
        15 => { 1 => 4, 2 => 3, 3 => 2 },
        16 => { 1 => 4, 2 => 3, 3 => 3 },
        17 => { 1 => 4, 2 => 3, 3 => 3 },
        18 => { 1 => 4, 2 => 3, 3 => 3 },
        19 => { 1 => 4, 2 => 3, 3 => 3, 4 => 1 },
        20 => { 1 => 4, 2 => 3, 3 => 3, 4 => 1 }
      }.freeze

      def spell_classes
        @spell_classes ||= begin
          result = __getobj__.spell_classes
          result[:rogue] = {
            save_dc: 8 + proficiency_bonus + modifiers['int'],
            attack_bonus: proficiency_bonus + modifiers['int'],
            cantrips_amount: cantrips_amount,
            max_spell_level: max_spell_level,
            prepared_spells_amount: prepared_spells_amount,
            multiclass_spell_level: class_level / 3
          }
          result
        end
      end

      def spells_slots
        @spells_slots ||= SPELL_SLOTS[class_level]
      end

      private

      def class_level
        @class_level ||= classes['rogue']
      end

      def cantrips_amount
        return 3 if class_level >= 10

        2
      end

      def prepared_spells_amount # rubocop: disable Metrics/PerceivedComplexity, Metrics/AbcSize, Metrics/CyclomaticComplexity
        return 13 if class_level >= 20
        return 12 if class_level >= 19
        return 11 if class_level >= 16
        return 10 if class_level >= 14
        return 9 if class_level >= 13
        return 8 if class_level >= 11
        return 7 if class_level >= 10
        return 6 if class_level >= 8
        return 5 if class_level >= 7
        return 4 if class_level >= 4

        3
      end

      def max_spell_level
        SPELL_SLOTS[class_level].keys.max
      end
    end
  end
end
