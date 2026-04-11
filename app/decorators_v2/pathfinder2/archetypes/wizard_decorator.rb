# frozen_string_literal: true

module Pathfinder2
  module Archetypes
    class WizardDecorator < ApplicationDecoratorV2
      include Pathfinder2::Concerns

      def call(result:) # rubocop: disable Metrics/AbcSize
        @result = result
        @result['archetype_spells']['wizard'] = {
          'prepare' => true,
          'learn' => true,
          'cantrips_amount' => 4,
          'spells_amount' => spells_amount,
          'cantrip_slots' => 2,
          'spells_slots' => spells_slots,
          'max_spell_level' => spells_slots.keys.max.to_i,
          'spell_attack' => modified_abilities['int'] + proficiency_bonus(base_spell_attack.to_i),
          'spell_dc' => 10 + modified_abilities['int'] + proficiency_bonus(base_spell_dc.to_i),
          'spell_list' => 'arcane'
        }
      end

      private

      def spells_amount
        spells_slots.keys.max.to_i * 2
      end

      def spells_slots
        @spells_slots ||= begin
          slots = {}
          if available_features_slugs.include?('basic_wizard_spellcasting')
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
