# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class WarlockDecorator < ApplicationDecorator
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
            max_spell_level: max_spell_level,
            prepared_spells_amount: prepared_spells_amount,
            multiclass_spell_level: class_level # full level
          }
          result
        end
      end

      def spells_slots
        @spells_slots ||= SPELL_SLOTS[class_level]
      end

      # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity
      def static_spells
        @static_spells ||= begin
          eldritch_invocations = __getobj__.selected_features['eldritch_invocations']
          result = __getobj__.static_spells
          result['contact_other_plane'] = static_spell_attributes.merge({ 'limit' => 1 }) if level >= 9
          if eldritch_invocations
            result['find_familiar'] = static_spell_attributes if eldritch_invocations.include?('pact_of_the_chain')
            result['mage_armor'] = static_spell_attributes if eldritch_invocations.include?('armor_of_shadows')
            result['disguise_self'] = static_spell_attributes if eldritch_invocations.include?('mask_of_many_faces')
            result['false_life'] = static_spell_attributes if eldritch_invocations.include?('fiendish_vigor')
            result['jump'] = static_spell_attributes if eldritch_invocations.include?('otherworldly_leap')
            result['silent_image'] = static_spell_attributes if eldritch_invocations.include?('misty_visions')
            result['levitate'] = static_spell_attributes if eldritch_invocations.include?('ascendant_step')
            if eldritch_invocations.include?('gift_of_the_depths')
              result['water_breathing'] = static_spell_attributes.merge({ 'limit' => 1 })
            end
            result['alter_self'] = static_spell_attributes if eldritch_invocations.include?('master_of_myriad_forms')
            result['invisibility'] = static_spell_attributes if eldritch_invocations.include?('one_with_shadows')
            result['speak_with_dead'] = static_spell_attributes if eldritch_invocations.include?('whispers_of_the_grave')
            result['arcane_eye'] = static_spell_attributes if eldritch_invocations.include?('visions_of_distant_realms')
          end
          result
        end
      end
      # rubocop: enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity

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
