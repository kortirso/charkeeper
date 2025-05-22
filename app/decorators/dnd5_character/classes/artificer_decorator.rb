# frozen_string_literal: true

module Dnd5Character
  module Classes
    class ArtificerDecorator < ApplicationDecorator
      SPELL_SLOTS = {
        1 => { 1 => 2 },
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
      CLASS_SAVE_DC = %w[con int].freeze

      def class_save_dc
        @class_save_dc ||= main_class == 'artificer' ? CLASS_SAVE_DC : __getobj__.class_save_dc
      end

      # rubocop: disable Metrics/AbcSize
      def spell_classes
        @spell_classes ||= begin
          result = __getobj__.spell_classes
          result[:artificer] = {
            save_dc: 8 + proficiency_bonus + modifiers['int'],
            attack_bonus: proficiency_bonus + modifiers['int'],
            cantrips_amount: cantrips_amount,
            max_spell_level: max_spell_level,
            prepared_spells_amount: [modifiers['int'] + (class_level / 2), 1].max,
            multiclass_spell_level: (class_level / 2.0).round # half round up
          }
          result
        end
      end
      # rubocop: enable Metrics/AbcSize

      def spells_slots
        @spells_slots ||= SPELL_SLOTS[class_level]
      end

      private

      def class_level
        @class_level ||= classes['artificer']
      end

      def cantrips_amount
        return 4 if class_level >= 14
        return 3 if class_level >= 10

        2
      end

      def max_spell_level
        SPELL_SLOTS[class_level].keys.max
      end
    end
  end
end
