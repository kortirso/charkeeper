# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class TrickeryDomainDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        if class_level >= 3
          @result['static_spells']['charm_person'] = static_spell_attributes
          @result['static_spells']['disguise_self'] = static_spell_attributes
          @result['static_spells']['invisibility'] = static_spell_attributes
          @result['static_spells']['pass_without_trace'] = static_spell_attributes
        end
        if class_level >= 5
          @result['static_spells']['hypnotic_pattern'] = static_spell_attributes
          @result['static_spells']['nondetection'] = static_spell_attributes
        end
        if class_level >= 7
          @result['static_spells']['confusion'] = static_spell_attributes
          @result['static_spells']['dimension_door'] = static_spell_attributes
        end
        if class_level >= 9
          @result['static_spells']['dominate_person'] = static_spell_attributes
          @result['static_spells']['modify_memory'] = static_spell_attributes
        end
      end

      def class_level
        classes['cleric']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['wis'], 'save_dc' => 8 + proficiency_bonus + modifiers['wis'] }
      end
    end
  end
end
