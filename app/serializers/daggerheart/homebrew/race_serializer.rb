# frozen_string_literal: true

module Daggerheart
  module Homebrew
    class RaceSerializer < ApplicationSerializer
      attributes :id, :name

      def name
        translate(object.title)
      end
    end
  end
end
