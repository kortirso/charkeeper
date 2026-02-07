# frozen_string_literal: true

module Pathfinder2Character
  module Races
    class HalflingBuilder
      LANGUAGES = %w[common halfling].freeze

      def call(result:)
        result[:speed] = 25
        result[:health] = 6
        result[:languages] = result[:languages].concat(LANGUAGES).uniq
        result[:abilities].merge!({ str: -2, dex: 2, wis: 2 }) { |_, oldval, newval| oldval + newval }
        result[:ability_boosts].merge!({ free: 1 }) { |_, oldval, newval| oldval + newval }

        result[:ability_boosts_v2][:race] = { 'str_con_int_cha' => 1 }

        result
      end
    end
  end
end
