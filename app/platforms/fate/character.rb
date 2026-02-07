# frozen_string_literal: true

module Fate
  class CharacterData
    include StoreModel::Model

    attribute :aspects, array: true, default: { 'concept' => '', 'trouble' => '', 'a' => '', 'b' => '', 'c' => '' }
    attribute :phase_trio, array: true, default: { 'a' => '', 'b' => '', 'c' => '' }
  end

  class Character < Character
    attribute :data, Fate::CharacterData.to_type
  end
end
