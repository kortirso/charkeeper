# frozen_string_literal: true

class CharacterPolicy < ApplicationPolicy
  relation_scope do |relation|
    next relation if user.admin?

    user.characters
  end
end
