# frozen_string_literal: true

module CosmereCharacter
  module Ancestries
    class SingerBuilder
      def call(result:)
        result[:initial_talents] = result[:initial_talents].push('change_form')
        result
      end
    end
  end
end
