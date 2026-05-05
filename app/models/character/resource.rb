# frozen_string_literal: true

class Character
  class Resource < ApplicationRecord
    belongs_to :character, class_name: '::Character'
    belongs_to :custom_resource, class_name: '::CustomResource'
  end
end
