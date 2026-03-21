# frozen_string_literal: true

module Dnd2024
  module Classes
    class WarlockDecorator < ApplicationDecoratorV2
      SPELL_SLOTS = {
        1 => { 1 => 1 },
        2 => { 1 => 2 },
        3 => { 1 => 0, 2 => 2 },
        4 => { 1 => 0, 2 => 2 },
        5 => { 1 => 0, 2 => 0, 3 => 2 },
        6 => { 1 => 0, 2 => 0, 3 => 2 },
        7 => { 1 => 0, 2 => 0, 3 => 0, 4 => 2 },
        8 => { 1 => 0, 2 => 0, 3 => 0, 4 => 2 },
        9 => { 1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 2 },
        10 => { 1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 2 },
        11 => { 1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 3, 6 => 0 },
        12 => { 1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 3, 6 => 0 },
        13 => { 1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 3, 6 => 0, 7 => 0 },
        14 => { 1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 3, 6 => 0, 7 => 0 },
        15 => { 1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 3, 6 => 0, 7 => 0, 8 => 0 },
        16 => { 1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 3, 6 => 0, 7 => 0, 8 => 0 },
        17 => { 1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 4, 6 => 0, 7 => 0, 8 => 0, 9 => 0 },
        18 => { 1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 4, 6 => 0, 7 => 0, 8 => 0, 9 => 0 },
        19 => { 1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 4, 6 => 0, 7 => 0, 8 => 0, 9 => 0 },
        20 => { 1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 4, 6 => 0, 7 => 0, 8 => 0, 9 => 0 }
      }.freeze
      CLASS_SAVE_DC = %w[wis cha].freeze

      def call(result:)
        @result = result
        @result['class_save_dc'] = CLASS_SAVE_DC if main_class == 'warlock'
        @result['spell_classes']['warlock'] = spell_class_info
        @result['spells_slots'] = SPELL_SLOTS[class_level] || SPELL_SLOTS[20]
        find_static_spells
        @result
      end

      def spell_class_info
        {
          save_dc: 8 + proficiency_bonus + modifiers['cha'],
          attack_bonus: proficiency_bonus + modifiers['cha'],
          cantrips_amount: cantrips_amount,
          max_spell_level: max_spell_level,
          prepared_spells_amount: prepared_spells_amount,
          multiclass_spell_level: class_level # full level
        }
      end

      # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity, Layout/LineLength
      def find_static_spells
        eldritch_invocations = selected_features['eldritch_invocations']
        @result['static_spells']['contact_other_plane'] = static_spell_attributes.merge({ 'limit' => 1 }) if level >= 9
        return unless eldritch_invocations

        @result['static_spells']['find_familiar'] = static_spell_attributes if eldritch_invocations.include?('pact_of_the_chain')
        @result['static_spells']['mage_armor'] = static_spell_attributes if eldritch_invocations.include?('armor_of_shadows')
        @result['static_spells']['disguise_self'] = static_spell_attributes if eldritch_invocations.include?('mask_of_many_faces')
        @result['static_spells']['false_life'] = static_spell_attributes if eldritch_invocations.include?('fiendish_vigor')
        @result['static_spells']['jump'] = static_spell_attributes if eldritch_invocations.include?('otherworldly_leap')
        @result['static_spells']['silent_image'] = static_spell_attributes if eldritch_invocations.include?('misty_visions')
        @result['static_spells']['levitate'] = static_spell_attributes if eldritch_invocations.include?('ascendant_step')
        if eldritch_invocations.include?('gift_of_the_depths')
          @result['static_spells']['water_breathing'] = static_spell_attributes.merge({ 'limit' => 1 })
        end
        @result['static_spells']['alter_self'] = static_spell_attributes if eldritch_invocations.include?('master_of_myriad_forms')
        @result['static_spells']['invisibility'] = static_spell_attributes if eldritch_invocations.include?('one_with_shadows')
        @result['static_spells']['speak_with_dead'] = static_spell_attributes if eldritch_invocations.include?('whispers_of_the_grave')
        @result['static_spells']['arcane_eye'] = static_spell_attributes if eldritch_invocations.include?('visions_of_distant_realms')
      end
      # rubocop: enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity, Layout/LineLength

      private

      def class_level
        @class_level ||= classes['warlock']
      end

      def cantrips_amount
        return 4 if class_level >= 10
        return 3 if class_level >= 4

        2
      end

      def prepared_spells_amount
        return class_level + 1 if class_level < 9

        10 + ((class_level - 9) / 2)
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
