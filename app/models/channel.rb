# frozen_string_literal: true

class Channel < ApplicationRecord
  TELEGRAM = 'telegram'
  OWLBEAR = 'owlbear'

  belongs_to :campaign, optional: true

  enum :provider, { TELEGRAM => 0, OWLBEAR => 1 }
end
