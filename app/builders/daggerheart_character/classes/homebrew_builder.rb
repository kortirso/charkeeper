# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class HomebrewBuilder
      def initialize(id:)
        @data = Daggerheart::Homebrew::Speciality.find_by(id: id)&.data
      end

      def call(result:)
        result[:evasion] = @data&.evasion || 10
        result[:health_max] = @data&.health_max || 6
        result[:stress_max] = 6
        result[:hope_max] = 6
        result
      end

      def equip(...); end
    end
  end
end
