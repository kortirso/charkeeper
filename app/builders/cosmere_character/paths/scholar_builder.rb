# frozen_string_literal: true

module CosmereCharacter
  module Paths
    class ScholarBuilder
      def call(result:)
        result[:selected_skills] = { 'lore' => 1 }
        result[:initial_talent] = 'erudition'
        result
      end
    end
  end
end
