# frozen_string_literal: true

module Adminbook
  module Daggerheart
    module Homebrew
      class SubclassesController < Adminbook::BaseController
        def index
          @pagy, @subclasses = pagy(::Daggerheart::Homebrews::Subclass.order(created_at: :desc), limit: 25)
          find_class_names
        end

        private

        def find_class_names
          @classes =
            ::Daggerheart::Homebrews::Speciality
              .where(id: @subclasses.pluck(:info).pluck('class_id'))
              .pluck(:id, :title).to_h
        end
      end
    end
  end
end
