# frozen_string_literal: true

module Pathfinder2Character
  module Subraces
    class CustomBuilder
      def call(result:) # rubocop: disable Metrics/AbcSize
        record = Pathfinder2::Homebrews::Subrace.find_by(id: result[:subrace])
        return result unless record

        info = record.info.attributes.symbolize_keys

        result[:speed] = info[:speed] if info[:speed]
        result[:health] = info[:health] if info[:health]
        result[:vision] = info[:vision] if info[:vision]

        if info[:skill_boosts].any?
          result[:skill_boosts].merge!(info[:skill_boosts].tally.symbolize_keys) { |_, oldval, newval| oldval + newval }
        end
        result[:feats] = result[:feats].concat(info[:feats]).uniq if info[:feats].any?

        result
      end
    end
  end
end
