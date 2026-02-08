# frozen_string_literal: true

module Rolls
  class Fate
    def call
      rand(-1..1)
    end
  end
end
