# frozen_string_literal: true

module CosmereCharacter
  module Paths
    class HunterBuilder
      def call(result:)
        result[:selected_skills] = { 'perception' => 1 }
        result[:initial_talents] = ['seek_quarry']
        result
      end
    end
  end
end
