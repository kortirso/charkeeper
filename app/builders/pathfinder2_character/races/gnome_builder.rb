# frozen_string_literal: true

module Pathfinder2Character
  module Races
    class GnomeBuilder
      LANGUAGES = %w[common fey gnomish].freeze

      def call(result:)
        result[:speed] = 25
        result[:health] = 8
        result[:languages] = result[:languages].concat(LANGUAGES).uniq
        result[:abilities].merge!({ str: -2, con: 2, cha: 2 }) { |_, oldval, newval| oldval + newval }
        result[:ability_boosts].merge!({ free: 1 }) { |_, oldval, newval| oldval + newval }
        result[:vision] = 'low-light'

        result[:ability_boosts_v2][:race] = { 'str_dex_int_wis' => 1 }

        result
      end
    end
  end
end
