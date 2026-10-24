# frozen_string_literal: true

module Pathfinder2Character
  module Races
    class CustomBuilder
      def call(result:) # rubocop: disable Metrics/AbcSize
        record = Pathfinder2::Homebrews::Race.find_by(id: result[:race])
        return result unless record

        info = record.info.attributes.deep_symbolize_keys

        result[:speed] = info[:speed]
        result[:health] = info[:health]
        result[:languages] = result[:languages].concat(info[:languages]).uniq
        result[:abilities].merge!(info[:abilities]) { |_, oldval, newval| oldval + newval }
        result[:vision] = info[:vision] if info[:vision]
        result[:ability_boosts_v2][:race] = info[:ability_boosts].tally.symbolize_keys

        result
      end
    end
  end
end
