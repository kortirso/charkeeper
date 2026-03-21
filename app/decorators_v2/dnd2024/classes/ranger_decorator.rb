# frozen_string_literal: true

module Dnd2024
  module Classes
    class RangerDecorator < ApplicationDecoratorV2
      SPELL_SLOTS = {
        1 => { 1 => 2 },
        2 => { 1 => 2 },
        3 => { 1 => 3 },
        4 => { 1 => 4, 2 => 2 },
        5 => { 1 => 4, 2 => 2 },
        6 => { 1 => 4, 2 => 3 },
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
      CLASS_SAVE_DC = %w[str dex].freeze

      def call(result:)
        @result = result
        @result['class_save_dc'] = CLASS_SAVE_DC if main_class == 'ranger'
        @result['spell_classes']['ranger'] = spell_class_info
        @result['spells_slots'] = SPELL_SLOTS[class_level] || SPELL_SLOTS[20]
        @result['attacks_per_action'] = 2 if class_level >= 5
        @result['speed'] = speed + 10 if class_level >= 6
        find_static_spells
        @result
      end

      private

      def spell_class_info
        {
          save_dc: 8 + proficiency_bonus + modifiers['wis'],
          attack_bonus: proficiency_bonus + modifiers['wis'],
          cantrips_amount: cantrips_amount,
          max_spell_level: max_spell_level,
          prepared_spells_amount: prepared_spells_amount,
          multiclass_spell_level: class_level / 2 # half round down
        }
      end

      def find_static_spells
        @result['static_spells']['hunter_mark'] =
          static_spell_attributes.merge({ 'limit' => (class_level + 7) / 4, 'level' => 1 })
      end

      def class_level
        @class_level ||= classes['ranger']
      end

      def cantrips_amount
        return 4 if class_level >= 14
        return 3 if class_level >= 10

        2
      end

      # rubocop: disable Metrics/PerceivedComplexity
      def prepared_spells_amount
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
      # rubocop: enable Metrics/PerceivedComplexity

      def max_spell_level
        SPELL_SLOTS[class_level].keys.max
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['wis'], 'save_dc' => 8 + proficiency_bonus + modifiers['wis'] }
      end
    end
  end
end
