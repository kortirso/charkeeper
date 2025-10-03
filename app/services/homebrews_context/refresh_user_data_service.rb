# frozen_string_literal: true

module HomebrewsContext
  class RefreshUserDataService
    def call(user:)
      homebrews_collection = User::Homebrew.find_or_create_by(user: user)
      homebrews_collection.update(data: HomebrewsContext::FindAvailableService.new.call(user_id: user.id))
    end
  end
end
