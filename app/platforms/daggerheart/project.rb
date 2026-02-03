# frozen_string_literal: true

module Daggerheart
  class Project < ApplicationRecord
    self.table_name = :daggerheart_projects

    belongs_to :character
    belongs_to :goal, polymorphic: true, optional: true
  end
end
