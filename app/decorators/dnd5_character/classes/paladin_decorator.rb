# frozen_string_literal: true

module Dnd5Character
  module Classes
    class PaladinDecorator < ApplicationDecorator
      SPELL_SLOTS = {
        1 => {},
        2 => { 1 => 2 },
        3 => { 1 => 3 },
        4 => { 1 => 3 },
        5 => { 1 => 4, 2 => 2 },
        6 => { 1 => 4, 2 => 2 },
        7 => { 1 => 4, 2 => 3 },
        8 => { 1 => 4, 2 => 3 },
        9 => { 1 => 4, 2 => 3, 3 => 2 },
        10 => { 1 => 4, 2 => 3, 3 => 2 },
        11 => { 1 => 4, 2 => 3, 3 => 3 },
        12 => { 1 => 4, 2 => 3, 3 => 3 },
        13 => { 1 => 4, 2 => 3, 3 => 3, 4 => 1 },
        14 => { 1 => 4, 2 => 3, 3 => 3, 4 => 1 },
        15 => { 1 => 4, 2 => 3, 3 => 3, 4 => 2 },
        16 => { 1 => 4, 2 => 3, 3 => 3, 4 => 2 },
        17 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 1 },
        18 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 1 },
        19 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 2 },
        20 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 2 }
      }.freeze
      CLASS_SAVE_DC = %w[wis cha].freeze

      def class_save_dc
        @class_save_dc ||= main_class == 'paladin' ? CLASS_SAVE_DC : __getobj__.class_save_dc
      end

      # rubocop: disable Metrics/AbcSize
      def spell_classes
        @spell_classes ||= begin
          result = __getobj__.spell_classes
          result[:paladin] = {
            save_dc: 8 + proficiency_bonus + modifiers['cha'],
            attack_bonus: proficiency_bonus + modifiers['cha'],
            cantrips_amount: 0,
            max_spell_level: max_spell_level,
            prepared_spells_amount: [modifiers['cha'] + (class_level / 2), 1].max,
            multiclass_spell_level: class_level / 2 # half round down
          }
          result
        end
      end
      # rubocop: enable Metrics/AbcSize

      def spells_slots
        @spells_slots ||= SPELL_SLOTS[class_level]
      end

      def attacks_per_action
        @attacks_per_action ||= class_level >= 5 ? 2 : 1
      end

      private

      def class_level
        @class_level ||= classes['paladin']
      end

      def max_spell_level
        SPELL_SLOTS[class_level].keys.max
      end
    end
  end
end
