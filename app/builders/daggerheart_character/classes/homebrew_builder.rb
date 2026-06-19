# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class HomebrewBuilder
      def initialize(id:)
        @info = Daggerheart::Homebrews::Speciality.find_by(id: id)&.info
      end

      def call(result:)
        result[:evasion] = @info&.evasion || 10
        result[:health_max] = @info&.health_max || 6
        result[:stress_max] = 6
        result[:hope_max] = 6
        result
      end

      def equip(...); end
    end
  end
end
