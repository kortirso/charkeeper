# frozen_string_literal: true

module Dnd2024
  module Homebrew
    class RaceSerializer < ApplicationSerializer
      attributes :id, :name

      def name
        translate(object.title)
      end
    end
  end
end
