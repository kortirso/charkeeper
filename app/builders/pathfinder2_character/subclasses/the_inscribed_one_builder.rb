# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class TheInscribedOneBuilder
      def call(result:)
        result[:skill_boosts].merge!({ arcana: 1 }) { |_, oldval, newval| oldval + newval }
        result[:spell_list] = 'arcane'
        result[:focus_spells] = result[:focus_spells].push('discern_secrets').uniq
        result[:spells] = result[:spells].push('runic_weapon').uniq

        result
      end
    end
  end
end
