# frozen_string_literal: true

module Pathfinder2Character
  module Races
    class DwarfBuilder
      LANGUAGES = %w[common dwarven].freeze

      def call(result:)
        result[:speed] = 20
        result[:health] = 10
        result[:languages] = result[:languages].split(', ').concat(LANGUAGES).uniq.join(', ')
        result[:abilities].merge!({ cha: -2, con: 2, wis: 2 }) { |_, oldval, newval| oldval + newval }
        result[:ability_boosts].merge!({ free: 1 }) { |_, oldval, newval| oldval + newval }
        result[:vision] = 'dark'

        result[:ability_boosts_v2][:race] = { 'str_dex_int_cha' => 1 }

        result
      end
    end
  end
end
