# frozen_string_literal: true

module CosmereCharacter
  module Ancestries
    class HomebrewBuilder
      def initialize(id:)
        @info = Cosmere::Homebrews::Ancestry.find_by(id: id)&.info
      end

      def call(result:)
        result[:initial_talents] = result[:initial_talents].concat(@info.initial_talents) if @info&.initial_talents
        result[:attribute_points] = @info.attribute_points if @info&.attribute_points
        result
      end
    end
  end
end
