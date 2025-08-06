# frozen_string_literal: true

class CampaignPolicy < ApplicationPolicy
  def destroy?
    user.id == record.user_id
  end
end
