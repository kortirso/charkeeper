# frozen_string_literal: true

module Frontend
  class BotsController < Frontend::BaseController
    def create
      only_head_response
    end
  end
end
