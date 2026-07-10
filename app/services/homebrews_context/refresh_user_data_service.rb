# frozen_string_literal: true

module HomebrewsContext
  class RefreshUserDataService
    def call(user:)
      collection = User::Homebrew.find_or_create_by(user: user)
      user_data_same = user.homebrew_updated_at && user.homebrew_updated_at < collection.updated_at
      last_book = user.books.maximum(:updated_at)
      book_data_same = last_book ? (user.homebrew_updated_at && user.homebrew_updated_at < last_book) : true
      return if user_data_same && book_data_same

      collection.update(data: HomebrewsContext::FindAvailableService.new.call(user_id: user.id))
    end
  end
end
