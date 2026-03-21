# frozen_string_literal: true

module Dnd2024
  module Classes
    class PaladinDecorator < ApplicationDecoratorV2
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
      CLASS_SAVE_DC = %w[wis cha].freeze

      def call(result:)
        @result = result
        @result['class_save_dc'] = CLASS_SAVE_DC if main_class == 'paladin'
        @result['spell_classes']['paladin'] = spell_class_info
        @result['spells_slots'] = SPELL_SLOTS[class_level] || SPELL_SLOTS[20]
        @result['attacks_per_action'] = 2 if class_level >= 5
        find_static_spells
        @result
      end

      private

      def spell_class_info
        {
          save_dc: 8 + proficiency_bonus + modifiers['cha'],
          attack_bonus: proficiency_bonus + modifiers['cha'],
          cantrips_amount: 0,
          max_spell_level: max_spell_level,
          prepared_spells_amount: prepared_spells_amount,
          multiclass_spell_level: class_level / 2 # half round down
        }
      end

      def find_static_spells
        @result['static_spells']['divine_smite'] = static_spell_attributes.merge({ 'limit' => 1, 'level' => 1 }) if level >= 2
        @result['static_spells']['find_steed'] = static_spell_attributes.merge({ 'limit' => 1, 'level' => 2 }) if level >= 5
      end

      def class_level
        @class_level ||= classes['paladin']
      end

      def prepared_spells_amount # rubocop: disable Metrics/PerceivedComplexity
        return 15 if class_level >= 19
        return 14 if class_level >= 17
        return 12 if class_level >= 15
        return 11 if class_level >= 13
        return 10 if class_level >= 11
        return 9 if class_level >= 9
        return 7 if class_level >= 8
        return class_level if class_level >= 6

        class_level + 1
      end

      def max_spell_level
        SPELL_SLOTS[class_level].keys.max
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['cha'], 'save_dc' => 8 + proficiency_bonus + modifiers['cha'] }
      end
    end
  end
end
