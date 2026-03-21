# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class GloomStalkerDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        @result['static_spells']['disguise_self'] = static_spell_attributes if class_level >= 3
        @result['static_spells']['rope_trick'] = static_spell_attributes if class_level >= 5
        @result['static_spells']['fear'] = static_spell_attributes if class_level >= 9
        @result['static_spells']['greater_invisibility'] = static_spell_attributes if class_level >= 13
        @result['static_spells']['seeming'] = static_spell_attributes if class_level >= 17
      end

      def class_level
        classes['ranger']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['wis'], 'save_dc' => 8 + proficiency_bonus + modifiers['wis'] }
      end
    end
  end
end
