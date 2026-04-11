# frozen_string_literal: true

module Pathfinder2
  module Archetypes
    class WitchDecorator < ApplicationDecoratorV2
      include Pathfinder2::Concerns

      def call(result:)
        @result = result
        @result['archetype_spells']['witch'] = find_spells_info if selected_features['witch_dedication']
      end

      private

      def find_spells_info
        {
          'prepare' => true,
          'learn' => true,
          'cantrips_amount' => 2,
          'spells_amount' => spells_amount,
          'cantrip_slots' => 1,
          'spells_slots' => spells_slots,
          'max_spell_level' => spells_slots.keys.max.to_i,
          'spell_attack' => modified_abilities['int'] + proficiency_bonus(base_spell_attack.to_i),
          'spell_dc' => 10 + modified_abilities['int'] + proficiency_bonus(base_spell_dc.to_i),
          'spell_list' => spell_list
        }
      end

      def spell_list
        "Pathfinder2Character::Subclasses::#{selected_features['witch_dedication'].camelize}Builder".constantize::SPELL_LIST
      end

      def spells_amount
        spells_slots.keys.max.to_i * 2
      end

      def spells_slots
        @spells_slots ||= begin
          slots = {}
          if available_features_slugs.include?('basic_witch_spellcasting')
            slots['1'] = 1 if level >= 4
            slots['2'] = 1 if level >= 6
            slots['3'] = 1 if level >= 8
          end
          slots
        end
      end
    end
  end
end
