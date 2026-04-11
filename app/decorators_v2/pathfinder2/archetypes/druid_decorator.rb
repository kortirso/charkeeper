# frozen_string_literal: true

module Pathfinder2
  module Archetypes
    class DruidDecorator < ApplicationDecoratorV2
      include Pathfinder2::Concerns

      def call(result:, features_count:) # rubocop: disable Metrics/AbcSize
        @result = result
        @features_count = features_count
        @result['archetype_spells']['druid'] = {
          'prepare' => true,
          'learn' => false,
          'cantrip_slots' => 2,
          'spells_slots' => spells_slots,
          'max_spell_level' => spells_slots.keys.max.to_i,
          'spell_attack' => modified_abilities['wis'] + proficiency_bonus(base_spell_attack.to_i),
          'spell_dc' => 10 + modified_abilities['wis'] + proficiency_bonus(base_spell_dc.to_i),
          'spell_list' => 'primal'
        }
      end

      private

      def spells_slots
        @spells_slots ||= {}
      end
    end
  end
end
