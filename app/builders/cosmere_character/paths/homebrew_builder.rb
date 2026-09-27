# frozen_string_literal: true

module CosmereCharacter
  module Paths
    class HomebrewBuilder
      def initialize(id:)
        @info = Cosmere::Homebrews::Path.find_by(id: id)&.info
      end

      def call(result:)
        result[:selected_skills] = @info.selected_skills.tally if @info&.selected_skills
        result[:initial_talents] = @info.initial_talents if @info&.initial_talents
        result
      end
    end
  end
end
