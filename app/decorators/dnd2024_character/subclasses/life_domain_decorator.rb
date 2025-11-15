# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class LifeDomainDecorator < ApplicationDecorator
      def static_spells # rubocop: disable Metrics/MethodLength, Metrics/AbcSize
        @static_spells ||= begin
          result = __getobj__.static_spells
          if class_level >= 3
            result['aid'] = static_spell_attributes
            result['bless'] = static_spell_attributes
            result['cure_wounds'] = static_spell_attributes
            result['lessser_restoration'] = static_spell_attributes
          end
          if class_level >= 5
            result['mass_healing_word'] = static_spell_attributes
            result['revivify'] = static_spell_attributes
          end
          if class_level >= 7
            result['aura_of_life'] = static_spell_attributes
            result['death_ward'] = static_spell_attributes
          end
          if class_level >= 9
            result['greater_restoration'] = static_spell_attributes
            result['mass_cure_wounds'] = static_spell_attributes
          end
          result
        end
      end

      private

      def class_level
        classes['cleric']
      end

      def static_spell_attributes
        { 'attack_bonus' => proficiency_bonus + modifiers['cha'], 'save_dc' => 8 + proficiency_bonus + modifiers['cha'] }
      end
    end
  end
end
