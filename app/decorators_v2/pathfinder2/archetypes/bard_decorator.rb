# frozen_string_literal: true

module Pathfinder2
  module Archetypes
    class BardDecorator < ApplicationDecoratorV2
      include Pathfinder2::Concerns

      def call(result:) # rubocop: disable Metrics/AbcSize
        @result = result
        @result['archetype_spells']['bard'] = {
          'prepare' => false,
          'learn' => true,
          'cantrips_amount' => 2,
          'spells_amount' => spells_slots.values.sum,
          'max_spell_level' => spells_slots.keys.max.to_i,
          'spell_attack' => modified_abilities['cha'] + proficiency_bonus(base_spell_attack.to_i),
          'spell_dc' => 10 + modified_abilities['cha'] + proficiency_bonus(base_spell_dc.to_i),
          'spell_list' => 'occult'
        }
      end

      private

      def spells_slots
        @spells_slots ||= begin
          slots = {}
          if available_features_slugs.include?('basic_bard_spellcasting')
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
