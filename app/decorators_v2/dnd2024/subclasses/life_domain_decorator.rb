# frozen_string_literal: true

module Dnd2024
  module Subclasses
    class LifeDomainDecorator < ApplicationDecoratorV2
      def call(result:)
        @result = result
        find_static_spells
        @result
      end

      private

      def find_static_spells # rubocop: disable Metrics/AbcSize
        if class_level >= 3
          @result['static_spells']['aid'] = static_spell_attributes
          @result['static_spells']['bless'] = static_spell_attributes
          @result['static_spells']['cure_wounds'] = static_spell_attributes
          @result['static_spells']['lessser_restoration'] = static_spell_attributes
        end
        if class_level >= 5
          @result['static_spells']['mass_healing_word'] = static_spell_attributes
          @result['static_spells']['revivify'] = static_spell_attributes
        end
        if class_level >= 7
          @result['static_spells']['aura_of_life'] = static_spell_attributes
          @result['static_spells']['death_ward'] = static_spell_attributes
        end
        if class_level >= 9
          @result['static_spells']['greater_restoration'] = static_spell_attributes
          @result['static_spells']['mass_cure_wounds'] = static_spell_attributes
        end
      end

      def class_level
        classes['cleric']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['cha'], 'save_dc' => 8 + proficiency_bonus + modifiers['cha'] }
      end
    end
  end
end
