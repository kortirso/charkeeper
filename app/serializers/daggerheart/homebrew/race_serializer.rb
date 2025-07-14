# frozen_string_literal: true

module Daggerheart
  module Homebrew
    class RaceSerializer < ApplicationSerializer
      attributes :id, :name, :domains

      delegate :domains, to: :data
      delegate :data, to: :object
    end
  end
end
